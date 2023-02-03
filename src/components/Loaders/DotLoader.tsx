const DotLoader = ({ cls = '' }: { cls?: string }) => {
  return (
    <div className={`inline-flex items-center ${cls}`}>
      <div className={'loader-dot1 bg-black dark:bg-white'} />
      <div className={'loader-dot2 bg-black dark:bg-white'} />
      <div className={'loader-dot3 bg-black dark:bg-white'} />
    </div>
  );
};

export default DotLoader;
