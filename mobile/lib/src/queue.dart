import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:metroskool_flutter_core/metroskool_flutter_core.dart';

/// Attendance mark queued while the teacher is offline.
class AttendancePayload {
  const AttendancePayload({
    required this.registerId,
    required this.learnerId,
    required this.status,
    required this.idempotencyKey,
    this.reasonId,
    this.notes,
  });

  final String registerId;
  final String learnerId;
  final String status;
  final String idempotencyKey;
  final String? reasonId;
  final String? notes;

  Map<String, Object?> toJson() => {
        'registerId': registerId,
        'learnerId': learnerId,
        'status': status,
        'idempotencyKey': idempotencyKey,
        'reasonId': reasonId,
        'notes': notes,
      };

  factory AttendancePayload.fromJson(Map<String, Object?> json) {
    return AttendancePayload(
      registerId: json['registerId'] as String,
      learnerId: json['learnerId'] as String,
      status: json['status'] as String,
      idempotencyKey: json['idempotencyKey'] as String,
      reasonId: json['reasonId'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class EnqueueResult {
  const EnqueueResult({required this.created, required this.item});

  final bool created;
  final SyncQueueItem item;
}

/// XOR stream cipher over a 32-byte key. Enough to keep plaintext out of the
/// in-memory blob; production devices should wrap this with platform keystore.
class _XorBox {
  _XorBox(this.key);

  final Uint8List key;

  String seal(String plaintext) {
    final bytes = utf8.encode(plaintext);
    final out = Uint8List(bytes.length);
    for (var i = 0; i < bytes.length; i++) {
      out[i] = bytes[i] ^ key[i % key.length];
    }
    return base64Encode(out);
  }

  String open(String blob) {
    final bytes = base64Decode(blob);
    final out = Uint8List(bytes.length);
    for (var i = 0; i < bytes.length; i++) {
      out[i] = bytes[i] ^ key[i % key.length];
    }
    return utf8.decode(out);
  }
}

/// Idempotent Monitor attendance queue. Conflict policy is always server-wins.
class MonitorAttendanceQueue implements SyncQueue {
  MonitorAttendanceQueue({Uint8List? key})
      : _box = _XorBox(key ?? _randomKey());

  final _XorBox _box;
  final Map<String, SyncQueueItem> _items = {};

  static Uint8List _randomKey() {
    final random = Random.secure();
    return Uint8List.fromList(List<int>.generate(32, (_) => random.nextInt(256)));
  }

  Future<EnqueueResult> enqueueAttendance({
    required SchoolId schoolId,
    required AttendancePayload payload,
  }) async {
    final existing = _items[payload.idempotencyKey];
    if (existing != null) {
      return EnqueueResult(created: false, item: existing);
    }
    final item = SyncQueueItem(
      id: payload.idempotencyKey,
      schoolId: schoolId,
      moduleId: ModuleId.monitor,
      idempotencyKey: payload.idempotencyKey,
      status: SyncQueueStatus.pending,
      payloadJson: _box.seal(jsonEncode(payload.toJson())),
      createdAt: DateTime.now().toUtc(),
    );
    await enqueue(item);
    return EnqueueResult(created: true, item: item);
  }

  AttendancePayload decode(SyncQueueItem item) {
    final decoded = jsonDecode(_box.open(item.payloadJson)) as Map<String, dynamic>;
    return AttendancePayload.fromJson(decoded.cast<String, Object?>());
  }

  @override
  Future<void> enqueue(SyncQueueItem item) async {
    _items.putIfAbsent(item.idempotencyKey, () => item);
  }

  @override
  Future<List<SyncQueueItem>> pending() async {
    return _items.values
        .where((row) => row.status == SyncQueueStatus.pending)
        .toList(growable: false);
  }

  @override
  Future<void> markAcked(String id) async {
    final current = _items[id];
    if (current == null) return;
    _items[id] = SyncQueueItem(
      id: current.id,
      schoolId: current.schoolId,
      moduleId: current.moduleId,
      idempotencyKey: current.idempotencyKey,
      status: SyncQueueStatus.acked,
      payloadJson: current.payloadJson,
      createdAt: current.createdAt,
    );
  }

  String? lastFailureReason;

  @override
  Future<void> markFailed(String id, String reason) async {
    lastFailureReason = reason;
    final current = _items[id];
    if (current == null) return;
    _items[id] = SyncQueueItem(
      id: current.id,
      schoolId: current.schoolId,
      moduleId: current.moduleId,
      idempotencyKey: current.idempotencyKey,
      status: SyncQueueStatus.failed,
      payloadJson: current.payloadJson,
      createdAt: current.createdAt,
    );
  }
}
