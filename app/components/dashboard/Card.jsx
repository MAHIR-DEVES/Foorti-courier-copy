import Image from 'next/image';

const performanceData = [
  {
    title: 'Delivery Processing',
  },

  {
    title: 'COD Processing',
  },

  {
    title: 'Return Request',
  },

  {
    title: 'Latest Return',
  },
];

const Card = () => {
  return (
    <div
      className="grid grid-cols-4 gap-3 pb-2 mt-5
    "
    >
      {performanceData.map((item, index) => (
        <div
          key={index}
          className="md:flex justify-between gap-3 px-2 py-3 md:py-4 bg-primary border border-gray rounded-md"
        >
          <div className="md:block">
            <h2 className="text-[20px] text-primary font-semibold whitespace-nowrap">
              {item.title} 0
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
