import styles from "./editUser.module.css";
import icon from "../../assets/x.svg";

function EditUser(props){
    return(
        <div className={styles.profile}>
            <div className={styles.pic}>
                <img src="#" alt="Proflie pic" className={styles.icon}/>
                <img onClick={props.profileToggler} src={icon} alt="icon" className={`${styles.icon} ${styles.exit}`} />
            </div>
            <form>
                <div className={styles.optionchange}>
                    <label htmlFor="newName"><h1 className={styles.username}>Nazwa uzytkownika:</h1></label>
                    <input type='text' placeholder="New name" id='newName'/>
                </div>
                <div className={styles.optionchange}>
                    <label htmlFor="newDesc"><h2>Opis:</h2></label>
                    <input type="text" id="newDesc" placeholder="New description"/>
                </div>
                <div className={styles.optionchange}>
                    <label htmlFor="newAge"><h2>Wiek:</h2></label>
                    <input type="number" id="newAge" placeholder="New age"/>
                </div>
                <div className={styles.optionchange}>
                    <button type="submit" className={styles.edit}>Accept</button>
                    <button type="delete" className={styles.edit}>Delete</button>
                </div>
            </form>
        </div>
    )
}

export default EditUser;
