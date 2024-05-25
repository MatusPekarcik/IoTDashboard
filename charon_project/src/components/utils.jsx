import axios from 'axios';

const port = 3001;

export function rAfterStr(ss,s) {
  var i = ss.lastIndexOf(s)
  return (i==-1)?'':ss.substring(i+s.length,ss.length).trim();
}

export function clrStr(ss,ch) {
  return ss.split(ch).join('');
}

// "Duplicate entry '<value>' for key '<key_name>' " 
// parseSQLDuplicate returns <key_name>, trimmed substring after last 'key' without apostrophes 
export function parseSQLDuplicKey(errmsg) {
  return clrStr(rAfterStr(errmsg,'key'),"'").trim();
}

export async function message(cmd,data) {
  if (!data) data = {};
  if (cmd!='mqtt_refresh' && cmd!='refresh' ) console.log('Message:',cmd,data);
  data.cmd=cmd; data.type=cmd;
  var e = new CustomEvent('Command',{detail:data});
 // var e = new CustomEvent('Command',{detail: {data:data, type:cmd }});
  window.dispatchEvent(e);
}


export async function notifyError( fnc ) {
  try { await fnc() }
  catch (error) { message('notify',{notify:'error',title :error.message}) }
}



/*
export async function post(url,data) {
  const options = {
        method: 'POST', 
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(data)
  };
   
  try {

    console.log('@post:',url,data);

    const response = await fetch(`http://localhost:${port}/${url}`,options);
   
//    if (!response.ok) {
//      console.log('@resp',response);
//      throw new Error(`Response error: ${response.status}`);
//    }
  
    var res = response.json();
    if (!res.ok) {
      if (res?.error==undefined) res.error = {errmsg:'Internal error '}
      else if (!res.error?.errmsg) res.error.errmsg = 'Network error';

      console.log('@error:',res);
    }
    return res;   

   // return await response.json();
        
  } catch (error) {
    console.error('@Query error:', error);          
    return {errmsg:error};
  }

}
*/

export function isNumber(str) {
  return !isNaN(parseFloat(str)) && isFinite(str);
}

export async function post(url,data) {
  try {
     throw new Error('Invalid server call');

     console.log('before axios.post',data);
     const response = await axios.post(`http://localhost:${port}/${url}`,data);
     console.log('after axios.post',response.data);
     return response.data;
  }
  catch (error) {
    //console.log(error.message);
    return  { ok:false, error: { errmsg:`Request error: "${url}",${error}` }};
  }

}

/*
export async function post(url,data) {

  const options = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };


try {
  const response = await fetch(`http://localhost:${port}/${url}`, options);

  console.log('before fetch');

  const res = await response.json();
   
  console.log('after fetch:',res);
  
  if (!res.ok) {
    console.log('--error:', res?.error, !res.error);
  
    if (!res.error) {
      res.error = { errmsg: 'Internal error' };
    } else if (!res.error.errmsg) {
      res.error.errmsg = 'Network error';
    }

    console.log('@error:', res);
  }

  return res;

} catch (error) {
  // POST {url} net::ERR_CONECTION_REFUSED                                  // inside fetch ?
  // Chyba pri spracovaní odpovede: TypeError: Failed to fetch

  console.error('Chyba pri spracovaní odpovede:', error);
  return {ok:false, error: { errmsg:`Request error: "${url}",${error}` }};
}
}

export default post;
*/

