import "./Spinner.css";
import imageSource from "../../../assets/loading.webp"





export function Spinner() {
    return (
        <div className="Spinner">

			<img src={imageSource}/>

        </div>
    );
}