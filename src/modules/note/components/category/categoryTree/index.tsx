import * as React        from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class Index extends React.Component {

    public props: any = undefined;

    constructor(props: any) {
        super(props);
    }

    public shouldComponentUpdate(nextProps: any, nextState: any) {

        let flag = false;

        if (this.props.data !== nextProps.data) {
            flag = true;
        }

        return flag;
    }

    public render() {

        const Tree = (props: any, data: any = undefined): any => {

            const categorySourceData = props && props.data && props.data.length > 0 ? props.data : data;
            let categoryData         = JSON.parse(JSON.stringify(categorySourceData));

            const sourceCategoryDataToTreeData = (sourceData: any) => {

                sourceData.forEach((item: any) => {
                    delete item.children;
                });

                const map = {};
                sourceData.forEach((item: any) => {
                    map[item.id] = item;
                });
                const val: any = [];
                sourceData.forEach((item: any) => {
                    const parentObj = map[item.parent];
                    if (parentObj) {
                        (parentObj.children || (parentObj.children = [])).push(item);
                    } else {
                        val.push(item);
                    }
                });
                return val;
            };

            categoryData = sourceCategoryDataToTreeData(categoryData);

            if (categoryData && categoryData.length > 0) {
                const loop = (categoryDataTemps: any) => {
                    return categoryDataTemps.map((item: any) => {
                        return (
                            <div
                                className="item" key={item.id}
                                data-menu-id={item.id}
                                data-is-last={!item.children && 'true'}
                                data-is-super={item.is_super}
                            >
                                <label>
                                    <span className={`icon extension ${item.children ? 'icon-1' : ''}`}>
                                        {item.children && <FontAwesomeIcon className="fa-icon" icon="angle-right"/>}
                                    </span>
                                    <span className={`icon icon-2`}>
                                        <img title={item.iconText || 'folder'} src={require(`../../../../../statics/common/images/svg/${item.iconText || 'folder'}.svg`)}/>
                                    </span>
                                    <span className="text">{item.name}</span>
                                </label>
                                {item.children && item.children.length > 0 ? loop(item.children) : ''}
                            </div>
                        )
                    });
                };
                return loop(categoryData);
            } else {
                return ('');
            }
        };

        return (<Tree data={this.props.data}/>)
    }
}

export default Index;
