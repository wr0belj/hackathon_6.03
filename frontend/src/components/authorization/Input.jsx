import React from "react";
import styles from "./Input.module.css";

const Input = React.forwardRef((props, ref) => {
  return (
    <div className={styles["input-box"]}>
      <label htmlFor={props.id} className={styles.label}>
        {props.label}
      </label>
      <input
        ref={ref}
        type={props.type}
        id={props.id}
        className={styles.input}
      />
    </div>
  );
});

export default Input;
