import { cn } from "@/lib/utils";

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

const GridContainer = ({ children, className }: GridContainerProps) => {
  return (
    <div
      className={cn(
        "xs:grid xs:grid-cols-4 xs:col-span-4 xs:col-start-1",
        "lg:col-start-2 lg:col-span-10 lg:grid-cols-12",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default GridContainer;
