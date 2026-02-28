function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-800 ${className ?? ""}`}
    />
  );
}

export { Bone };
