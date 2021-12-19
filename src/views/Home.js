import ActivitySpace from "../components/ActivitySpace";
import ChannelType from "../components/ChannelType";
import ChannelInfo from "../components/ChannelInfo";

function Home() {
  return (
    <div className="view home">
      <ChannelType />
      <div className="contentArea">
        <ChannelInfo />
        <ActivitySpace />
      </div>
    </div>
  );
}

export default Home;
