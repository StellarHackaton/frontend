export function Skeleton({
  className = "",
  rounded = "rounded-[14px]",
}: {
  className?: string;
  rounded?: string;
}) {
  return <div className={`skeleton ${rounded} ${className}`} />;
}

// Row skeleton matching the order/product list item shape.
export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-ink/[.05] bg-white/40 p-3.5">
      <div className="flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-3 w-1/4" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-5 w-16" rounded="rounded-full" />
      </div>
    </div>
  );
}
