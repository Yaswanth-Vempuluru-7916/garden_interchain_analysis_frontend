interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">
      {title}
    </h2>
  );
};

export default SectionHeader;