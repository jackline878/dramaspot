const axios = require('axios');
const qs = require('qs');

// Export as reusable async function
module.exports = async function rewriteContent(content) {
  const postData = qs.stringify({
    action: 'fetchUrl',
    nonce: '31af66608a',
    dataInput: `Rewrite: "${content}".`,
    crc: '2',
    endpoint: 'https://api.seoreviewtools.com/ai-connect/',
    toolUrl: 'wp-content/themes/seoreviewtools/seotools/functions/ai.php'
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Origin': 'https://www.seoreviewtools.com',
    'Referer': 'https://www.seoreviewtools.com/content-analysis/?content_rewriter=1',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': 'PHPSESSID=a2rv8vgp6sebom5kdfid5dgbkc; _ga=GA1.2.1155136810.1752146035; _gid=GA1.2.406389352.1752146035; cf_clearance=dysaoQvN1.be41gi6fpeGNbxsiaOBrlPnrvXL2xY2zw-1752149930-1.2.1.1-V1qpCk1JL5468H9XTQh3rL.ImzW3CEWM5OILAO.M2UX3raKIOWYPR_ZVavIoc3Y1XKpJB98CA1UTx8d5DFR02cXXIbeboHIaTl431nEqZGnRT.BvssxZCb1Jm7wkRfYi1ib7w1TnM_M3VI4gIeGTveDTgbX.juN_xgVifMkhJY_vnpb7bm8bwkoKHb7QXCcMC8XxjjcHR9ft3xIyUzigLPmy9cvw7WOr1e2cDUsmDAI; _ga_LLQ2L7YJ5K=GS2.2.s1752149930$o2$g1$t1752149930$j60$l0$h0'
  };

  try {
    const response = await axios.post(
      'https://www.seoreviewtools.com/wp-admin/admin-ajax.php',
      postData,
      { headers }
    );

    console.log('✅ Response received:');
    console.log(response.data);
    
    return response.data;

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      return error.response.data;
    }
    return null;
  }
};
