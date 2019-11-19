import * as React from 'react';
import './logo.scss';

class Index extends React.Component {

    public componentDidMount() {
        const leftHemisphere: any  = document.querySelector('.left-hemisphere');
        const rightHemisphere: any = document.querySelector('.right-hemisphere');
        const muzzleBase: any      = document.querySelector('.muzzle-base');
        const mouth: any           = document.querySelector('.mouth');
        const leftEye: any         = document.querySelector('.left-eye__circle');
        const rightEye: any        = document.querySelector('.right-eye__circle');
        const rightEyebrow: any    = document.querySelector('.right-eyebrow');
        const leftEyebrow: any     = document.querySelector('.left-eyebrow');
        const text: any            = document.querySelectorAll('.text');

        const addClasses = () => {
            leftHemisphere.classList.add('left-hemisphere-anim');
            rightHemisphere.classList.add('right-hemisphere-anim');
            muzzleBase.classList.add('muzzle-base-anim');
            mouth.classList.add('mouth-anim');
            leftEye.classList.add('eyes-anim');
            rightEye.classList.add('eyes-anim');
            rightEyebrow.classList.add('right-eyebrow-anim');
            leftEyebrow.classList.add('left-eyebrow-anim');
            text.forEach((letter: any) => {
                letter.classList.add('text-anim');
            });
        };

        addClasses();

    }

    public render() {
        return (
            <div className="app-logo">
                <svg version="1.1" id="Layer_1" x="0px" y="0px"
                     viewBox="5 -25 250 250" preserveAspectRatio="xMidYMin" width="250">
                    <g id="head">
                        <path className="st0 left-hemisphere" d="M184.6,66.6l15-14.4c0,0,1.7-0.1,0.6,3.3c0,0,14-3.7,20.8-0.7c0,0,0.9,19.4-13.3,34.2
   		c0,0,9,18.1,6.9,24.3c0,0-1.7-1.8-4.2-3.1c0,0,1.7,18.8-0.2,21.6c0,0-3.5-8.4-12-13c0,0,4.3,0.1,4.7,0.2c0.4,0.2-8.9-9.1-18.6-9.9
   		c0,0,0.1-1.2,6-1.3c0,0-6.2-4.3-18.1-3.8l1.5-1.5c0,0-4.8-2.9-14.5,9.6c0,0-10.1-26.7,14.3-30.9c0,0,0.9-0.9-5.5,6.7
   		c0,0,9.8-6,19.1-3.2c0,0,3,0.5-4.9,2.8c0,0,11.8,2,14.2,5.7c0,0,0.9-10.2-6.4-16.6c0,0,5.9,1.3,9.8,3.3c3.9,2,13.5-19.2,13.5-19.2
   		S198.8,59.1,184.6,66.6z"/>
                        <path className="st0 right-hemisphere" d="M116.4,66.6l-15-14.4c0,0-1.7-0.1-0.6,3.3c0,0-14-3.7-20.8-0.7
   		c0,0-0.9,19.4,13.3,34.2c0,0-9,18.1-6.9,24.3c0,0,1.7-1.8,4.2-3.1c0,0-1.7,18.8,0.2,21.6c0,0,3.5-8.4,12-13c0,0-4.3,0.1-4.7,0.2
   		c-0.4,0.2,8.9-9.1,18.6-9.9c0,0-0.1-1.2-6-1.3c0,0,6.2-4.3,18.1-3.8l-1.5-1.5c0,0,4.8-2.9,14.5,9.6c0,0,10.1-26.7-14.3-30.9
   		c0,0-0.9-0.9,5.5,6.7c0,0-9.8-6-19.1-3.2c0,0-3,0.5,4.9,2.8c0,0-11.8,2-14.2,5.7c0,0-0.9-10.2,6.4-16.6c0,0-5.9,1.3-9.8,3.3
   		S87.7,60.8,87.7,60.8S102.1,59.1,116.4,66.6z"/>
                    </g>
                    <g id="muzzle">
                        <path className="st0 muzzle-base" d="M144.6,142.4l-3.3-14.6c0,0-0.7-2-4.4,0c0,0-26.2,22.4-5.5,30.4s44.4,2.4,45.9-7
   		c1.5-9.4-15.3-29.6-18.2-22.7c-2.9,6.9-3.6,13.2-3.6,13.2s9.1,11.3-2.6,14.6C141.4,159.7,139.2,150,144.6,142.4z"/>
                        <path className="st0 mouth" d="M138.4,163.5c0,0,2.4,4.8,12.4,4.6s13.9-6.6,13.9-6.6S144.9,163.2,138.4,163.5z"/>
                        <g id="teeth">
                            <path className="st1 left-tooth" d="M130.4,157.8c0,0,0.6,3.7,1.5,4.3c0.9,0.6,1.6,1.1,2.4-2.8L130.4,157.8z"/>
                            <path className="st1 right-tooth" d="M169.6,158.8c0,0-0.6,3.7-1.5,4.3c-0.9,0.6-1.6,1.1-2.4-2.8L169.6,158.8z"/>
                        </g>
                    </g>
                    <g id="eyes">
                        <g id="right-eye">
                            <circle className="st1 right-eye__circle" cx="172.3" cy="113" r="2.7"/>
                            <path className="st0 right-eyebrow" d="M177.5,113l1.7-0.3c0,0,2.2,9.6-8.8,7.6v-1.7C170.4,118.7,178.1,120.5,177.5,113z"/>
                        </g>
                        <g id="left-eye">
                            <circle className="st1 left-eye__circle" cx="128.7" cy="113" r="2.7"/>
                            <path className="st0 left-eyebrow" d="M123.4,113l-1.7-0.3c0,0-2.2,9.6,8.8,7.6v-1.7C130.5,118.7,122.8,120.5,123.4,113z"/>
                        </g>
                    </g>
                </svg>
            </div>
        )
    }
}

export default Index;
