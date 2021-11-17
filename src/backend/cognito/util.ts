import { CognitoUserAttrs } from './CognitoUserAttrs';

export const unwrapUserAttr = (attrs?: CognitoUserAttrs[]) => {
    if (!attrs)
        return {};

    const unwrappedAttrs: Record<string, string> = {};
    for (const a of attrs) {
        if (!a.Name || !a.Value) continue;
        unwrappedAttrs[a.Name] = a.Value;
    }
    return unwrappedAttrs;
};
