import 'ids.dart';

enum SyncQueueStatus { pending, acked, failed }

/// One encrypted offline item waiting to reach Supabase.
class SyncQueueItem {
  const SyncQueueItem({
    required this.id,
    required this.schoolId,
    required this.moduleId,
    required this.idempotencyKey,
    required this.status,
    required this.payloadJson,
    required this.createdAt,
  });

  final String id;
  final SchoolId schoolId;
  final ModuleId moduleId;
  final String idempotencyKey;
  final SyncQueueStatus status;

  /// Ciphertext (or sealed blob). Must not contain plaintext marks.
  final String payloadJson;
  final DateTime createdAt;
}

/// Idempotent offline queue. Conflict policy is server-wins.
abstract class SyncQueue {
  Future<void> enqueue(SyncQueueItem item);
  Future<List<SyncQueueItem>> pending();
  Future<void> markAcked(String id);
  Future<void> markFailed(String id, String reason);
}
