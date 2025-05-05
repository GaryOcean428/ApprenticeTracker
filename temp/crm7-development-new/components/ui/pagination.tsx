import React, { useEffect } from 'react';
import Link from 'next/link';

interface PaginationProps {
  dataLength: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPageData: number;
}

const Pagination = ({ 
  dataLength, 
  currentPage, 
  setCurrentPage, 
  perPageData 
}: PaginationProps): React.ReactElement => {
  const handleClick = (page: number): void => {
    setCurrentPage(page);
  };

  const pageNumbers: number[] = [];
  for (let i = 1; i <= Math.ceil(dataLength / perPageData); i++) {
    pageNumbers.push(i);
  }

  const handlePrevPage = (): void => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
  };

  const handleNextPage = (): void => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    if (pageNumbers.length > 0 && pageNumbers.length < currentPage) {
      setCurrentPage(pageNumbers.length);
    }
  }, [pageNumbers.length, currentPage, setCurrentPage]);

  // CSS classes for buttons
  const disabledClass = 'px-3 py-2 leading-tight text-muted-foreground border ' +
    'border-gray-300 bg-gray-100 cursor-not-allowed inline-block';
  const prevBtnClass = 'px-3 py-2 leading-tight text-blue-600 bg-white border ' + 
    'border-gray-300 rounded-l-md hover:bg-gray-100 hover:text-blue-700';
  const nextBtnClass = 'px-3 py-2 leading-tight text-blue-600 bg-white border ' + 
    'border-gray-300 rounded-r-md hover:bg-gray-100 hover:text-blue-700';
  const activePageClass = 'px-3 py-2 leading-tight text-blue-600 bg-blue-50 border ' + 
    'border-blue-300 hover:bg-blue-100 hover:text-blue-700';
  const inactivePageClass = 'px-3 py-2 leading-tight text-gray-500 bg-white border ' + 
    'border-gray-300 hover:bg-gray-100 hover:text-gray-700';

  return (
    <div className='flex justify-end mb-4'>
      <ul className='flex items-center space-x-1 text-sm'>
        {currentPage <= 1 ? (
          <li>
            <span className={`${disabledClass} rounded-l-md`}>
              Previous
            </span>
          </li>
        ) : (
          <li>
            <Link 
              href='#' 
              className={prevBtnClass}
              onClick={handlePrevPage}
            >
              Previous
            </Link>
          </li>
        )}
        
        {pageNumbers.map((item) => (
          <li key={`page-${item}`}>
            <Link 
              href='#' 
              className={currentPage === item ? activePageClass : inactivePageClass}
              onClick={() => handleClick(item)}
            >
              {item}
            </Link>
          </li>
        ))}
        
        {currentPage >= pageNumbers.length ? (
          <li>
            <span className={`${disabledClass} rounded-r-md`}>
              Next
            </span>
          </li>
        ) : (
          <li>
            <Link 
              href='#' 
              className={nextBtnClass}
              onClick={handleNextPage}
            >
              Next
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Pagination;
