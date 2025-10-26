export default function RatingStars({ value = 0, onChange, size = 20, readOnly = false }) {
  const stars = [1,2,3,4,5];
  return (
    <div className="inline-flex items-center gap-1">
      {stars.map((s) => (
        <svg
          key={s}
          onClick={() => !readOnly && onChange?.(s)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={`cursor-${readOnly ? 'default' : 'pointer'} ${s <= value ? 'fill-yellow-400 stroke-yellow-400' : 'fill-gray-200 stroke-gray-300'}`}
        >
          <path strokeWidth="1" d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.401 8.168L12 18.896l-7.335 3.87 1.401-8.168L.132 9.21l8.2-1.192z"/>
        </svg>
      ))}
    </div>
  );
}
