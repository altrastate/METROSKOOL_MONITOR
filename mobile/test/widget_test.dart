import 'package:flutter_test/flutter_test.dart';
import 'package:metroskool_monitor_offline/main.dart';

void main() {
  testWidgets('shows Monitor register and queues an offline mark',
      (tester) async {
    await tester.pumpWidget(const MetroskoolMonitorApp());

    expect(find.text('Metroskool Monitor'), findsOneWidget);
    expect(find.text('Grade 8A · today'), findsOneWidget);
    expect(find.text('Ada Okello'), findsOneWidget);

    await tester.tap(find.text('Queue offline mark').first);
    await tester.pumpAndSettle();

    expect(find.text('Queued'), findsOneWidget);
    expect(find.textContaining('encrypted'), findsOneWidget);

    await tester.tap(find.text('Queue offline mark').first);
    await tester.pumpAndSettle();

    expect(
      find.textContaining('already queued'),
      findsOneWidget,
    );
  });
}
