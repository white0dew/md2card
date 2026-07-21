export function headlessStatusExpression() {
  return "({ status: document.body?.dataset.ideacardStatus, error: document.body?.dataset.ideacardError })";
}
