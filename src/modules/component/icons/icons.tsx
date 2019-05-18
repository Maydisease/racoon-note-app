import * as React from 'react';
import './icons.scss';

interface DefaultProps {
    icon: string,
    color?: string
}

const svgMaps = (require as any).context('../../../statics/common/images/svg/', false, /(.+\/)([^/]+)(\.svg)$/).keys();

const iconsMaps: string[] = svgMaps.map((item: string) => {
    return item.replace(/\.\/(.+?)\.svg/, '$1');
});

class IconsComponent extends React.Component {

    public props: DefaultProps;

    constructor(props: DefaultProps) {
        super(props);
    }

    public render() {

        return (
            <div className={`svgIconsComponents ${this.props.color}`} dangerouslySetInnerHTML={{__html: require(`../../../statics/common/images/svg/${this.props.icon}.svg`)}}/>
        )
    }
}

export {iconsMaps};

export default IconsComponent;
