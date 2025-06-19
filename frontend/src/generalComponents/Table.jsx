import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import _ from "lodash";

const Table = ({
  columns,
  data,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  pageSize = 10,
  title,
  onSearch,
  searchText,
}) => {
  const getPageNumbersToDisplay = () => {
    const pages = [];
    const maxVisible = 5;

    if (!totalPages || totalPages <= 0) return [];
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const renderTableHeader = () => (
    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
      <tr>
        {columns.map((column) => (
          <th
            key={column.dataIndex}
            className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider  hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <span>{column.title}</span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderTableBody = () => {
    const dataToRender = data || [];
    if (dataToRender.length === 0) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={columns.length}
              className="text-center px-6 py-10 text-slate-500"
            >
              {totalItems === 0
                ? "No data available."
                : "No data on this page, or matches local filters."}
            </td>
          </tr>
        </tbody>
      );
    }
    return (
      <tbody className="bg-white divide-y divide-slate-200">
        {dataToRender.map((record, index) => (
          <tr
            key={record?._id || record?.id || `record-${index}`}
            className="hover:bg-slate-50 transition-colors duration-150"
          >
            {columns.map((column) => (
              <td
                key={`${record?._id || record?.id || index}-${column.key}`}
                className="px-6 py-4 relative whitespace-nowrap text-sm text-slate-900"
              >
                {column.render ? column.render(record) : <div>N/A</div>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  const pageRangeStart = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const pageRangeEnd =
    totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0;
  const numDisplayedItems = data?.length || 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      {title && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
        </div>
      )}

      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search current page..."
              value={searchText}
              onChange={onSearch}
              className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            {renderTableHeader()}
            {renderTableBody()}
          </table>
        </div>

        {totalItems > 0 && totalPages > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-700">
                  Showing <span className="font-medium">{pageRangeStart}</span>-
                  <span className="font-medium">{pageRangeEnd}</span> of{" "}
                  <span className="font-medium">{totalItems}</span>
                  {data?.length !== numDisplayedItems &&
                    ` (${numDisplayedItems} after local filters)`}
                </div>
              </div>

              {totalPages > 1 && (
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    {" "}
                    <ChevronLeft className="h-4 w-4" />{" "}
                  </button>
                  <div className="flex items-center space-x-1">
                    {getPageNumbersToDisplay().map((page, index) => (
                      <button
                        key={`page-${page}-${index}`}
                        onClick={() => onPageChange(page)}
                        disabled={page === "..." || page === currentPage}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === currentPage
                            ? "bg-blue-500 text-white cursor-default"
                            : page === "..."
                            ? "text-slate-400 cursor-default"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {" "}
                        {page}{" "}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    {" "}
                    <ChevronRight className="h-4 w-4" />{" "}
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
