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

  const list = useAsyncList({
    async load({signal, cursor}) {
      if (cursor) {
        setIsLoading(false);
      }

      const res = await fetch(cursor || "https://swapi.py4e.com/api/people/?search=", {signal});
      const json = await res.json();

      setHasMore(json.next !== null);

      return {
        items: json.results,
        cursor: json.next,
      };
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({hasMore, onLoadMore: list.loadMore});

  const tableColumnStyle = 'text-left z-20 p-2 bg-obsidianShadow rounded-lg'

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with infinite pagination"
      baseRef={scrollerRef}
      bottomContent={
        hasMore ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="white"/>
          </div>
        ) : null
      }
      classNames={{
        base: "max-h-[520px] overflow-scroll bg-background scrollbar-hide",
        table: "min-h-[400px] bg-background",
        thead: "bg-obsidianShadow",
        th: "bg-obsidianShadow",
        tr: "bg-background hover:bg-lime-900/50",
        td: "bg-transparent",
        wrapper: "bg-background",
      }}
      className="border border-borderColor rounded-xl bg-background"
    >
      <TableHeader>
        <TableColumn key="name" className={tableColumnStyle}>Name</TableColumn>
        <TableColumn key="height" className={tableColumnStyle}>Height</TableColumn>
        <TableColumn key="mass" className={tableColumnStyle}>Mass</TableColumn>
        <TableColumn key="birth_year" className={tableColumnStyle}>Birth year</TableColumn>
      </TableHeader>

      <TableBody
        isLoading={isLoading}
        items={list.items}
        loadingContent={<Spinner color="white" />}
        className="bg-background"
      >
        {(item) => (
          <TableRow key={item.name} className="border-b border-b-borderColor">
            {(columnKey) => (
              <TableCell className="p-2">{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default AsyncPagination;