const STATUS_META_MAP = {
  activo: 'Cobertura activa',
  active: 'Cobertura activa',
  al_dia: 'Cuenta al dia',
  reconciliado: 'Cuenta al dia',
  pago_pendiente: 'Pago pendiente',
  pendiente: 'Pago pendiente',
  bloqueado_por_metodo: 'Requiere atencion',
};

export function buildFriendlyDisplayName(value) {
  const raw = `${value || ''}`.trim();

  if (!raw) {
    return '';
  }

  const base = raw.includes('@') ? raw.split('@')[0] : raw;
  const cleaned = base.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!cleaned) {
    return '';
  }

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
}

export function getInitialsFromName(value, fallback = 'Cliente') {
  const friendlyName = buildFriendlyDisplayName(value) || fallback;
  const parts = friendlyName.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) || 'C';
  const second = parts[1]?.charAt(0) || parts[0]?.charAt(1) || 'L';
  return `${first}${second}`.toUpperCase();
}

export function getCustomerStatusMeta(status) {
  const normalizedStatus = `${status || ''}`.trim().toLowerCase();
  return STATUS_META_MAP[normalizedStatus] || 'Cobertura activa';
}

export function buildCustomerPortalUserPresentation({
  userName = '',
  userEmail = '',
  userStatus = '',
  userAvatarUrl = '',
  profileUrl = '',
} = {}) {
  const displayName = buildFriendlyDisplayName(userName)
    || buildFriendlyDisplayName(userEmail)
    || 'Cliente';

  return {
    displayName,
    displayMeta: getCustomerStatusMeta(userStatus),
    initials: getInitialsFromName(displayName),
    avatarUrl: `${userAvatarUrl || ''}`.trim(),
    profileUrl: `${profileUrl || ''}`.trim(),
    profileLabel: 'Ver perfil',
  };
}
