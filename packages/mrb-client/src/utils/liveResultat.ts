export const fixEventJSONResponse = async (response: Response) => {
  const invalidJSONString = await response.text()
  const validJSONString = invalidJSONString
    .replaceAll('"O"', 'O')
    .replaceAll(/\t/g, '')
  const jsonObject = JSON.parse(validJSONString)
  return jsonObject
}
