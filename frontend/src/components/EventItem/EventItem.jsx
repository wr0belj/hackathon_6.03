import EventIcon from "./EventIcon";
import styles from "./EventItem.module.css";
import icon from "../../assets/incrementPeople.svg";
import useFetch from "../../hooks/useFetch";
import { useContext } from "react";
import { UserContext } from "../../store/user-context";

function EventItem(props) {
  const { sendData } = useFetch();
  const { user } = useContext(UserContext);

  console.log(props.itemInfo);

  const setPosHandler = function (e) {
    props.setPos([props.itemInfo.latitude, props.itemInfo.longitude]);

    if (props.active === props.itemInfo.id) {
      props.setActive("");
    } else {
      props.setActive(props.itemInfo.id);
    }
  };

  const signHandler = function () {
    const url = "http://10.0.5.43:2137/api/event/addPerson";

    const data = {
      token: user.token,
      eventID: props.itemInfo.id,
    };

    sendData(url, data);
  };

  return (
    <li onClick={setPosHandler} className={styles["list-item"]}>
      <div className={styles["main-box"]}>
        <EventIcon icon={props.itemInfo.category} />
        <h1>{props.itemInfo.name}</h1>

        <h2>
          {props.itemInfo.actualPeople}/{props.itemInfo.maxPeople}
        </h2>
        <img
          onClick={signHandler}
          src={icon}
          alt="icon"
          className={styles.increment}
        />
      </div>

      {props.active === props.itemInfo.id && (
        <div className={styles["details-box"]}>
          <span className={styles["author-box"]}>
            <span>Stworzone przez:</span>
            <span className={styles.author}>{props.itemInfo.username}</span>
          </span>
          <p className={styles.description}>{props.itemInfo.description}</p>
          <div className={styles["date-box"]}>
            <span className={styles.date}></span>
            <span className={styles.date}></span>
          </div>
        </div>
      )}
    </li>
  );
}

export default EventItem;
