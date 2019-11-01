const mermaidChart = (code: any, mermaidType: string) => {
    return `` +
        `<div class="mermaid" mermaid-type="${mermaidType}">` +
        `<div class="source" style="display: none;">` +
        `${code}` +
        `</div>` +
        `<div class="display"></div>` +
        `</div>`;
};

const MermaidPlugin = (md: any) => {
    const temp              = md.renderer.rules.fence.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens: any, idx: any, options: any, env: any, slf: any) => {
        const token    = tokens[idx];
        const language = token.info;
        const code     = token.content.trim();
        let mdType     = code.split('\n') && code.split('\n')[0];
        mdType         = mdType.lastIndexOf(';') === (mdType.length - 1) ? mdType.substr(0, mdType.length - 1) : mdType;

        if (language && language.toLocaleUpperCase() === 'UML') {
            console.log('mermaidChart', mermaidChart(code, mdType));
            return mermaidChart(code, mdType);
        }

        return temp(tokens, idx, options, env, slf);
    }
};

export default MermaidPlugin;
