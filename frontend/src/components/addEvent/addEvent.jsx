import { useContext, useRef } from "react";
import useFetch from "../../hooks/useFetch";
import styles from "./addEvent.module.css";
import { UserContext } from "../../store/user-context";

function AddEvent(props) {
  const { sendData } = useFetch();
  const { user } = useContext(UserContext);
  const nameRef = useRef();
  const categoryRef = useRef();
  const descRef = useRef();
  const maxPeopRef = useRef();
  const startDataRef = useRef();
  const endDataRef = useRef();

  function Handler(e) {
    e.preventDefault();
    const url = "http://10.0.5.43:2137/api/event/add";

    const data = {
      token: user.token,
      name: nameRef.current.value,
      category: categoryRef.current.value,
      description: descRef.current.value,
      maxPeople: +maxPeopRef.current.value,
      coordinates: [props.position.lat, props.position.lng].join(","),
      startDate: new Date(startDataRef.current.value),
      endDate: new Date(endDataRef.current.value),
    };

    sendData(url, data, (d) => {
      console.log(d);
    });

    setTimeout(() => {
      props.updateMarkers();
    }, 100);
    props.closeHandler();
  }

  const overlayClose = function (e) {
    if (e.target !== e.currentTarget) return;

    props.closeHandler();
  };

  return (
    <div className={styles.overlay} onClick={overlayClose}>
      <div className={styles["add-event"]}>
        <h1 className={styles["title-newEvent"]}>Add new event</h1>
        <form>
          <div className={styles.opos}>
            <label htmlFor="Name">Event name:</label>
            <input
              ref={nameRef}
              type="text"
              id="Name"
              placeholder="Event name"
              className={styles["event-attributes"]}
              required
            />
          </div>
          <div className={styles.opos}>
            <label htmlFor="Type">Type of event</label>
            <select
              ref={categoryRef}
              id="Type"
              name="type"
              className={styles["event-attributes"]}
              required
            >
              <option value="beer">Beer</option>
              <option value="party">Party</option>
              <option value="gameBoards">Game Boards</option>
              <option value="Sport">Sport</option>
              <option value="culture">Culture</option>
              <option value="walk">Walk</option>
              <option value="bowling">Bowling</option>
              <option value="skating">Skating / Ice skateing</option>
              <option value="hangout">Hangout</option>
            </select>
          </div>
          <div className={styles.opos}>
            <label htmlFor="maxPeople">Number of people</label>
            <input
              ref={maxPeopRef}
              type="number"
              id="maxPeople"
              min={2}
              max={99}
              className={styles["event-attributes"]}
              required
            />
          </div>
          <div className={styles.opos}>
            <label htmlFor="Description">Event description</label>
            <input
              ref={descRef}
              type="text"
              id="Description"
              placeholder="Event description"
              className={styles["event-attributes"]}
              required
            />
          </div>
          <div className={styles.opos}>
            <label htmlFor="startDate">Start date</label>
            <input
              ref={startDataRef}
              type="datetime-local"
              id="startDate"
              className={styles["event-attributes"]}
              required
            />
          </div>
          <div className={styles.opos}>
            <label htmlFor="endDate">End date</label>
            <input
              ref={endDataRef}
              type="datetime-local"
              id="endDate"
              className={styles["event-attributes"]}
              required
            />
          </div>
          <div className={styles.divbtn}>
            <button type="submit" onClick={Handler} className={styles.addbtn}>
              Add new event
            </button>
            <button
              type="button"
              onClick={props.closeHandler}
              className={`${styles.addbtn} ${styles.cancelbtn}`}
            >
              Cancel event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEvent;
