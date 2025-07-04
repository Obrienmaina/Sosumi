import Link from "next/link";

const Breadcrumbs = ({ paths }) => {
  return (
    <div className="text-gray-600 text-sm mb-4">
      {paths.map((path, index) => (
        <span key={index}>
          <Link href={path.href} className="hover:underline">
            {path.label}
          </Link>
          {index < paths.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;