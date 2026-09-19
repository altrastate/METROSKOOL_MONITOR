import 'package:flutter/material.dart';
import 'package:metroskool_flutter_core/metroskool_flutter_core.dart';
import 'package:metroskool_monitor_offline/metroskool_monitor_offline.dart';

const _deepPurple = Color(0xFF4B0082);
const _secondaryPurple = Color(0xFF6B3FA0);
const _softLavender = Color(0xFFEDE4F5);
const _lightPurple = Color(0xFFC4A8E0);
const _accentRed = Color(0xFFC41E3A);
const _accentYellow = Color(0xFFE8B923);

const _demoSchool = SchoolId('11111111-1111-4111-8111-111111111150');
const _demoRegisterId = 'reg-grade-8a-today';

const _statuses = ['present', 'absent', 'late', 'excused'];

class _DemoLearner {
  const _DemoLearner(this.id, this.name);
  final String id;
  final String name;
}

const _learners = [
  _DemoLearner('learner-ada', 'Ada Okello'),
  _DemoLearner('learner-musa', 'Musa Kato'),
  _DemoLearner('learner-amina', 'Amina Nalubega'),
];

void main() {
  runApp(const MetroskoolMonitorApp());
}

class MetroskoolMonitorApp extends StatelessWidget {
  const MetroskoolMonitorApp({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = ColorScheme.fromSeed(
      seedColor: _deepPurple,
      brightness: Brightness.light,
    );
    return MaterialApp(
      title: 'Metroskool Monitor',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: scheme.copyWith(
          primary: _deepPurple,
          secondary: _secondaryPurple,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: _deepPurple,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: _deepPurple,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(48),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: _deepPurple,
            minimumSize: const Size.fromHeight(48),
            side: const BorderSide(color: _lightPurple),
          ),
        ),
      ),
      home: const MonitorHomePage(),
    );
  }
}

class MonitorHomePage extends StatefulWidget {
  const MonitorHomePage({super.key});

  @override
  State<MonitorHomePage> createState() => _MonitorHomePageState();
}

class _MonitorHomePageState extends State<MonitorHomePage> {
  final MonitorAttendanceQueue _queue = MonitorAttendanceQueue();
  final Map<String, String> _draftStatus = {
    for (final learner in _learners) learner.id: 'present',
  };
  List<SyncQueueItem> _pending = const [];
  String? _message;
  String? _error;

  @override
  void initState() {
    super.initState();
    _refreshPending();
  }

  Future<void> _refreshPending() async {
    final pending = await _queue.pending();
    if (!mounted) return;
    setState(() => _pending = pending);
  }

  Future<void> _queueMark(_DemoLearner learner) async {
    setState(() {
      _error = null;
      _message = null;
    });
    final result = await _queue.enqueueAttendance(
      schoolId: _demoSchool,
      payload: AttendancePayload(
        registerId: _demoRegisterId,
        learnerId: learner.id,
        status: _draftStatus[learner.id] ?? 'present',
        idempotencyKey: '$_demoRegisterId:${learner.id}',
      ),
    );
    await _refreshPending();
    if (!mounted) return;
    setState(() {
      if (result.created) {
        _message =
            'Saved an encrypted mark for ${learner.name}. Sync when you reconnect — Supabase stays authoritative.';
      } else {
        _message =
            '${learner.name} is already queued. The same idempotency key will not create a second attendance row.';
      }
    });
  }

  Future<void> _ackAll() async {
    for (final item in _pending) {
      await _queue.markAcked(item.id);
    }
    await _refreshPending();
    if (!mounted) return;
    setState(() {
      _message =
          'Demo sync acknowledged queued marks. Live devices send the same key to Monitor web.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment(-0.8, -1.1),
            radius: 1.2,
            colors: [_softLavender, Colors.white],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'TEACHING MONITOR',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: _secondaryPurple,
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Metroskool Monitor',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: _deepPurple,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Architecture for Campus Excellence',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: _deepPurple.withValues(alpha: 0.7),
                      ),
                ),
                const SizedBox(height: 20),
                _Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Grade 8A · today',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: _deepPurple,
                                  fontWeight: FontWeight.w600,
                                ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Queue offline marks on this device. Reconnect uses the same idempotency key so an attendance row is never duplicated.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: _deepPurple.withValues(alpha: 0.7),
                              height: 1.4,
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                for (final learner in _learners) ...[
                  _LearnerCard(
                    learner: learner,
                    status: _draftStatus[learner.id] ?? 'present',
                    queued: _pending.any(
                      (item) =>
                          item.idempotencyKey ==
                          '$_demoRegisterId:${learner.id}',
                    ),
                    onStatus: (value) {
                      setState(() => _draftStatus[learner.id] = value);
                    },
                    onQueue: () => _queueMark(learner),
                  ),
                  const SizedBox(height: 12),
                ],
                _Card(
                  borderColor: _accentYellow.withValues(alpha: 0.7),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Encrypted offline queue',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: _deepPurple,
                                  fontWeight: FontWeight.w600,
                                ),
                      ),
                      const SizedBox(height: 8),
                      if (_pending.isEmpty)
                        Text(
                          'No queued marks. Offline payloads stay sealed on this device.',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: _deepPurple.withValues(alpha: 0.7),
                                  ),
                        )
                      else
                        ..._pending.map((item) {
                          final learner = _learners
                              .where((row) =>
                                  item.idempotencyKey.endsWith(':${row.id}'))
                              .firstOrNull;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Text(
                              '${learner?.name ?? item.idempotencyKey} · pending · encrypted',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: _deepPurple,
                                  ),
                            ),
                          );
                        }),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: _pending.isEmpty ? null : _ackAll,
                        child: const Text('Demo-ack queue'),
                      ),
                    ],
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: _accentRed)),
                ],
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _message!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: _deepPurple,
                          height: 1.4,
                        ),
                  ),
                ],
                const SizedBox(height: 24),
                Text(
                  '© Altrastate Technologies · Monitor for teachers',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: _deepPurple.withValues(alpha: 0.45),
                      ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.child, this.borderColor});

  final Widget child;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: borderColor ?? _lightPurple.withValues(alpha: 0.45)),
      ),
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class _LearnerCard extends StatelessWidget {
  const _LearnerCard({
    required this.learner,
    required this.status,
    required this.queued,
    required this.onStatus,
    required this.onQueue,
  });

  final _DemoLearner learner;
  final String status;
  final bool queued;
  final ValueChanged<String> onStatus;
  final VoidCallback onQueue;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  learner.name,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: _deepPurple,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
              if (queued)
                const Text(
                  'Queued',
                  style: TextStyle(
                      color: _secondaryPurple,
                      fontSize: 12,
                      fontWeight: FontWeight.w600),
                ),
            ],
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: status,
            decoration: const InputDecoration(
              labelText: 'Status (offline queue)',
              border: OutlineInputBorder(),
            ),
            items: [
              for (final value in _statuses)
                DropdownMenuItem(value: value, child: Text(value)),
            ],
            onChanged: (value) {
              if (value != null) onStatus(value);
            },
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: onQueue,
            child: const Text('Queue offline mark'),
          ),
        ],
      ),
    );
  }
}
