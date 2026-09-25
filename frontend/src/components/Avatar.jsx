export default function Avatar({ photo, name = '', size = 44 }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {photo ? <img src={photo} alt="" /> : <span aria-hidden="true">{initials || '?'}</span>}
    </span>
  );
}
