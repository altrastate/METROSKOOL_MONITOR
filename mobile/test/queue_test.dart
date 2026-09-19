import 'package:metroskool_flutter_core/metroskool_flutter_core.dart';
import 'package:metroskool_monitor_offline/metroskool_monitor_offline.dart';
import 'package:test/test.dart';

void main() {
  test('same idempotency key does not create a second mark', () async {
    final queue = MonitorAttendanceQueue();
    final school = SchoolId('11111111-1111-4111-8111-111111111150');
    const payload = AttendancePayload(
      registerId: 'reg-1',
      learnerId: 'learner-1',
      status: 'absent',
      idempotencyKey: 'offline-mark-1',
    );
    final first =
        await queue.enqueueAttendance(schoolId: school, payload: payload);
    final second = await queue.enqueueAttendance(
      schoolId: school,
      payload: AttendancePayload(
        registerId: 'reg-1',
        learnerId: 'learner-1',
        status: 'present',
        idempotencyKey: 'offline-mark-1',
      ),
    );
    expect(first.created, isTrue);
    expect(second.created, isFalse);
    expect((await queue.pending()).length, 1);
    expect(queue.decode(first.item).status, 'absent');
    expect(first.item.payloadJson.contains('absent'), isFalse);
  });

  test('acked marks leave the pending list', () async {
    final queue = MonitorAttendanceQueue();
    final school = SchoolId('11111111-1111-4111-8111-111111111150');
    await queue.enqueueAttendance(
      schoolId: school,
      payload: const AttendancePayload(
        registerId: 'reg-1',
        learnerId: 'learner-1',
        status: 'late',
        idempotencyKey: 'offline-mark-1',
      ),
    );
    await queue.markAcked('offline-mark-1');
    expect(await queue.pending(), isEmpty);
  });
}
