const CustomErroToast = (props) => {

  return (
    <div className="flex flex-column" style={{ flex: '1' }}>
      <div className="text-center">
        <h4>Error</h4>
        <p>{props.message}</p>
      </div>
    </div>
  );
}

export default CustomErroToast;
