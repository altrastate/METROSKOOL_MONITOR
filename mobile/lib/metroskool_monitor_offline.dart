/// Metroskool Monitor mobile offline attendance queue.
///
/// Idempotent encrypted in-memory store. Supabase remains authoritative
/// (`serverWins`). Duplicate enqueue of the same key does not create a second
/// logical mark.
library metroskool_monitor_offline;

export 'src/queue.dart';
