/// Tenant school identifier. Values are UUIDs from Metroskool Admin.
class SchoolId {
  const SchoolId(this.value);

  final String value;

  @override
  String toString() => value;

  @override
  bool operator ==(Object other) => other is SchoolId && other.value == value;

  @override
  int get hashCode => value.hashCode;
}

/// Suite product that owns a queued payload.
enum ModuleId {
  admin,
  archive,
  monitor,
  pulse,
  vote,
}
