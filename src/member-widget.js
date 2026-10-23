export function buildMemberWidget(guild) {
  const online = [...guild.members.cache.values()].filter(member =>
    ['online', 'idle', 'dnd'].includes(member.presence?.status));
  online.sort((a, b) => {
    // Keep the owner first; otherwise follow Discord's displayed role groups.
    const ownerOrder = Number(b.id === guild.ownerId) - Number(a.id === guild.ownerId);
    if (ownerOrder) return ownerOrder;
    const aGroup = a.roles.hoist || guild.roles.everyone;
    const bGroup = b.roles.hoist || guild.roles.everyone;
    return bGroup.comparePositionTo(aGroup)
      || a.displayName.localeCompare(b.displayName, 'en', { sensitivity: 'base', numeric: true })
      || a.id.localeCompare(b.id);
  });
  return {
    name: guild.name,
    presenceCount: online.length,
    members: online.slice(0, 12).map(member => ({
      username: member.displayName,
      status: member.presence.status,
      avatarUrl: member.displayAvatarURL({ size: 64 }),
      roles: [...member.roles.cache.values()]
        .filter(role => role.id !== guild.id)
        .sort((a, b) => b.comparePositionTo(a))
        .map(role => ({ name: role.name, color: role.hexColor })),
    })),
  };
}
