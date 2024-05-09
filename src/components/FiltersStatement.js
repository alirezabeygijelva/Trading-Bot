const FiltersStatement = (props) => {
    const onClick = (ev) => {
        if (ev.target.localName !== "li") {
            if (ev.target.closest("li").style.color === 'lightblue') {
                ev.target.closest("li").style.color = "#495057"
            }
            else {
                ev.target.closest("li").style.color = "lightblue"
            }
        }
        else {
            if (ev.target.style.color === 'lightblue') {
                ev.target.style.color = "#495057"
            }
            else {
                ev.target.style.color = "lightblue"
            }
        }
    }

    return (
        <ul>
            {props.commonFiltersStatement && props.commonFiltersStatement.map((item, index) => {
                return (
                    <li key={`filters_statement_${index}`} onClick={(ev) => onClick(ev)} style={{ "cursor": "pointer" }}>
                        <strong>{item.name}</strong>
                        <span dangerouslySetInnerHTML={{ __html: item.description }}></span>
                    </li>
                )
            })}
            {props.specialFiltersStatement && props.specialFiltersStatement.map((item, index) => {
                return (
                    <li key={`filters_statement_${index}`} onClick={(ev) => onClick(ev)} style={{ "cursor": "pointer" }}>
                        <strong>{item.name}</strong>
                        <span dangerouslySetInnerHTML={{ __html: item.description }}></span>
                    </li>
                )
            })}
        </ul>
    )
}
export default FiltersStatement;