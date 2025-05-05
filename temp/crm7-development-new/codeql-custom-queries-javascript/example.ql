/**
 * @name React Component Security Check
 * @description Identifies potential security issues in React components
 * @kind problem
 * @problem.severity warning
 * @precision high
 * @id javascript/react-security-check
 * @tags security
 *       react
 */

import javascript
import semmle.javascript.frameworks.React
import semmle.javascript.security.dataflow.DomBasedXssQuery

/**
 * Holds if the node represents unsanitized data being rendered
 */
class UnsanitizedDataFlow extends DomBasedXss::Configuration {
  UnsanitizedDataFlow() { this = "UnsanitizedDataFlow" }
}

from ReactComponent component, DataFlow::Node dangerousNode
where
  // Check for dangerous usage of dangerouslySetInnerHTML
  exists(DataFlow::PropRead prop |
    prop = component.getAPropertyWrite().getRhs() and
    prop.getPropertyName() = "dangerouslySetInnerHTML"
  )
  or
  // Check for direct DOM manipulation
  exists(DataFlow::CallNode call |
    call.getCalleeName() in ["innerHTML", "outerHTML"] and
    component.getANode().flowsTo(call.getReceiver())
  )
  or
  // Check for unsanitized data flow
  any(UnsanitizedDataFlow config).hasFlow(_, dangerousNode) and
  dangerousNode.getFile() = component.getFile()
select
  component,
  "Potential security vulnerability: This React component may have unsafe data handling."