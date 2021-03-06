import './test.scss';
import * as React       from 'react';
import DynamicComponent from '../../services/dynamic_component';
import {ObserverEvent}  from '../../services/observer.service';
import Slider           from "../component/widgets/slider";

const DynamicTpl  = import('./dynamic_com/dynamic_tpl');
const DynamicTplB = import('./dynamic_com/dynamic_tpl_b');

class TestMain extends React.Component {

    public createdCom(tpl: any) {

        const comData = {
            name: 'tandongs',
            age : 31
        };

        const comA: any = new DynamicComponent();
        comA.init(tpl, comData);
        comA.subscribe('ok', (event: ObserverEvent) => {
            console.log(1111, event);
        });
    }

    public componentDidMount(): void {
        this.createdCom(DynamicTpl);
        this.createdCom(DynamicTplB);
    }

    public render() {
        return (
            <div id="tesExamplePage">
                <div className="bg">Example</div>
                <div className="container">
                    {/*<div id="asyncCom"/>*/}
                    <Slider
                        countMark={0}
                        currentMark={0}
                        outValueType={`rate`}
                        onDebug={false}
                        displayValue={true}
                        rangeMark={{min: 0, max: 30}}
                    />
                </div>
            </div>
        );
    }
}

export default TestMain;
