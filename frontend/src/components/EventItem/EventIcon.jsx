import beer from "../../assets/beer.svg";
import bowling from "../../assets/bowling.svg";
import culture from "../../assets/culture.svg";
import gameboard from "../../assets/gameboard.svg";
import hangout from "../../assets/hangout.svg";
import party from "../../assets/party.svg";
import shutdown from "../../assets/shutdown.svg";
import skating from "../../assets/skating.svg";
import sport from "../../assets/sport.svg";
import walk from "../../assets/walk.svg";

import styles from "./EventIcon.module.css";

const icons = {
  beer,
  bowling,
  culture,
  gameboard,
  hangout,
  party,
  shutdown,
  skating,
  sport,
  walk,
};

function EventIcon(props) {
  return (
    <img
      src={icons[props.icon] || icons.beer}
      alt="icon"
      className={styles["event-icon"]}
    />
  );
}

export default EventIcon;
