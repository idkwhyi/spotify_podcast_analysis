'use client'

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  getKeyValue,
} from "@nextui-org/react";
import {useInfiniteScroll} from "@nextui-org/use-infinite-scroll";
import {useAsyncList} from "@react-stately/data";

const AsyncPagination = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);

  let list = useAsyncList({
    async load({signal, cursor}) {
      if (cursor) {
        setIsLoading(false);
      }

      // If no cursor is available, then we're loading the first page.
      // Otherwise, the cursor is the next URL to load, as returned from the previous page.
      const res = await fetch(cursor || "https://swapi.py4e.com/api/people/?search=", {signal});
      let json = await res.json();

      setHasMore(json.next !== null);

      return {
        items: json.results,
        cursor: json.next,
      };
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({hasMore, onLoadMore: list.loadMore});

  const tableColumnStyle = 'text-left z-20 p-2'

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with infinite pagination"
      baseRef={scrollerRef}
      bottomContent={
        hasMore ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="white" />
          </div>
        ) : null
      }
      classNames={{
        base: "max-h-[520px] overflow-scroll",
        table: "min-h-[400px]",
      }}
      className="border border-borderColor rounded-xl"
    >
      <TableHeader className="sticky z-20 ">
        <TableColumn key="name" className={tableColumnStyle}>Name</TableColumn>
        <TableColumn key="height" className={tableColumnStyle}>Height</TableColumn>
        <TableColumn key="mass" className={tableColumnStyle}>Mass</TableColumn>
        <TableColumn key="birth_year" className={tableColumnStyle}>Birth year</TableColumn>
      </TableHeader>

      <TableBody
        isLoading={isLoading}
        items={list.items}
        loadingContent={<Spinner color="white" />}
      >
        {(item) => (
          <TableRow key={item.name} className="hover:bg-lime-900 p-2 border-b border-b-borderColor">
            {(columnKey) => <TableCell className="p-2 bg-transparent hover:bg-transparent">{getKeyValue(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default AsyncPagination