const rawData = [
  { id: 1, parentId: null },
  { id: 11, parentId: 1 },
  { id: 12, parentId: 1 },
  { id: 13, parentId: 1 },
  { id: 111, parentId: 11 },
  { id: 112, parentId: 11 },
  { id: 113, parentId: 11 },
  { id: 114, parentId: 11 },
  { id: 114, parentId: 11 },
  { id: 114, parentId: 11 },
  { id: 114, parentId: 11 },
  { id: 114, parentId: 11 },
]

const treeData = {
  id: 1,
  children: [
    { id: 11 },
    { id: 12, children: [{ id: 121 }, { id: 122 }] },
  ],
}
const renderComp = (node) => {
  console.log(node.id)

  if (node.children) {
    node.children.forEach((child) => renderComp(child))
  }
}

renderComp(treeData)
