import React from "react";

const Time = () => {
    const [date, setDate]= React.useState(new Date());

    React.useEffect(() => {

        const intervalId = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    return (
        <div className="flex justify-content-center align-content-center text-white font-bold">
            {
                date.toUTCString()
            }
        </div>
    );
}

export default Time;