import SearchBox from "./SearchBox";

type FooterProps = {
  onSearchSelect: (lng: number, lat: number) => void;
};

const FooterHome = ({ onSearchSelect }: FooterProps) => {
  return (
    <footer className="pt-5">
      <div>
        <SearchBox onSelect={onSearchSelect} />
      </div>
    </footer>
  );
};

export default FooterHome;
