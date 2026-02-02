import { useNavigate } from "react-router-dom";
import { CryptoModel } from "../../../Models/CryptoModel";
import "./CryptoCard.css";
import Toggle from "../../PageArea/Toggle/Toggle";


type CryptoCardProps = {
    currency: CryptoModel;
    isChecked: boolean;
    onChange: () => void;
}

export function CryptoCard(props: CryptoCardProps) {
    const navigate = useNavigate()

    function currentPrice() {
        navigate("/home/price/" + props.currency.id);
    }

    return (
        <div className="CryptoCard">
            <div className="card-header">
                <span> Name: {props.currency.name}</span>
                <span> Symbol: {props.currency.symbol}</span>
            </div>

            <div className="card-image">
                <img src={props.currency.image} />
            </div>

            <div className="card-footer">
                <button onClick={currentPrice}>More info</button>
                <Toggle
                    label="Follow"
                    isChecked={props.isChecked}
                    onChange={props.onChange}
                />
            </div>
        </div>
    );
}