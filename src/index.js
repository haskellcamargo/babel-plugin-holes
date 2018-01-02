const hasNoShortPropertyAccess = path =>
    !!path.findParent(({ node }) =>
        node.directives && node.directives.some(({ value }) => value.value === 'no short property access'))

export default ({ types: t }) => ({
    visitor: {
        CallExpression(path) {
            if (hasNoShortPropertyAccess(path)
                || !t.isMemberExpression(path.node.callee)
                || !t.isIdentifier(path.node.callee.object, { name: '_' })) {
                return
            }

            const parameter = path.scope.generateUidIdentifier('_')
            const lambda = t.arrowFunctionExpression(
                [parameter],
                t.callExpression(
                    t.memberExpression(
                        parameter,
                        path.node.callee.property
                    ),
                    path.node.arguments
                )
            )

            path.replaceWith(lambda)
        },

        MemberExpression(path) {
            if (!t.isIdentifier(path.node.object, { name: '_' }) || hasNoShortPropertyAccess(path)) {
                return
            }

            const parameter = path.scope.generateUidIdentifier('_')
            const lambda = t.arrowFunctionExpression(
                [parameter],
                t.memberExpression(
                    parameter,
                    path.node.property
                )
            )

            path.replaceWith(lambda)
        }
    }
})
