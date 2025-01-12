"use client";
import React from 'react'
import AsyncEpisodeTable from '@/components/table/AsyncPagination'

const page = () => {
  return (
    <div className='py-4'>
      <h1 className='h1'>Daily Episode Ranking</h1>
      <AsyncEpisodeTable/>
    </div>
  )
}

export default page