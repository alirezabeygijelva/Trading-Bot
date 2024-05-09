import React from 'react';

export const QuickActionsContext = React.createContext();

const QuickActionsContextProvider = (props) => {
    const [actionItems, setActionItems] = React.useState([]);
    const ref = React.useRef([]);

    const addItems = (items) => {
        if (ref.current) {
            items.forEach(element => {
                ref.current = ref.current.filter(x => x.itemId !== element.itemId);
                ref.current.push(element);
            });
            ref.current = ref.current.sort(compare)
            setActionItems(ref.current);
        }
    };

    const clearItem = () => {
        ref.current = ref.current.filter(x => x.isStatic);
        setActionItems(ref.current);
    };

    function compare(a, b) {
        if (a.isStatic && !b.isStatic) {
            return -1;
        }
        if (!a.isStatic && b.isStatic) {
            return 1;
        }
        return 0;
    }

    return (
        <QuickActionsContext.Provider
            value={{ actionItems, addItems, clearItem }}>
            {props.children}
        </QuickActionsContext.Provider>
    );
}

export default QuickActionsContextProvider;