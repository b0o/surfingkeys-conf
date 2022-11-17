// import Lu from "unicode/category/Lu.js" // Letter, uppercase
// import Ll from "unicode/category/Ll.js" // Letter, lowercase
// import Lt from "unicode/category/Lt.js" // Letter, titlecase
// import Lm from "unicode/category/Lm.js" // Letter, modifier
// import Lo from "unicode/category/Lo.js" // Letter, other
// import Mn from "unicode/category/Mn.js" // Mark, nonspacing
// import Mc from "unicode/category/Mc.js" // Mark, spacing combining
// import Me from "unicode/category/Me.js" // Mark, enclosing
// import Nd from "unicode/category/Nd.js" // Number, decimal digit
// import Nl from "unicode/category/Nl.js" // Number, letter
// import No from "unicode/category/No.js" // Number, other
// import Pc from "unicode/category/Pc.js" // Punctuation, connector
// import Pd from "unicode/category/Pd.js" // Punctuation, dash
// import Ps from "unicode/category/Ps.js" // Punctuation, open
// import Pe from "unicode/category/Pe.js" // Punctuation, close
// import Pi from "unicode/category/Pi.js" // Punctuation, initial quote
// import Pf from "unicode/category/Pf.js" // Punctuation, final quote
// import Po from "unicode/category/Po.js" // Punctuation, other
// import Sm from "unicode/category/Sm.js" // Symbol, math
// import Sc from "unicode/category/Sc.js" // Symbol, currency
// import Sk from "unicode/category/Sk.js" // Symbol, modifier
// import So from "unicode/category/So.js" // Symbol, other
// import Zs from "unicode/category/Zs.js" // Separator, space
// import Zl from "unicode/category/Zl.js" // Separator, line
// import Zp from "unicode/category/Zp.js" // Separator, paragraph

// TODO: Use https://github.com/iLib-js/UCD/blob/main/json/NamesList.json instead
// OR: Just use unicode-table API
import unicode from "unicode/category/index.js"

const chars = Object.values(unicode).flatMap((cat) => Object.values(cat))

// const chars = [
//   Lu, Ll, Lt, Lm, Lo,
//   Mn, Mc, Me,
//   Nd, Nl, No,
//   Pc, Pd, Ps, Pe, Pi, Pf, Po,
//   Sm, Sc, Sk, So,
//   Zs, Zl, Zp,
// ].flatMap((cat) => Object.values(cat))

export default function search(q) {
  const terms = q.toLowerCase().split(" ")
  return chars.filter((char) => {
    const name = char.name.toLowerCase()
    const val = char.value.toLowerCase()
    const valDec = parseInt(val, 16).toString()
    return terms.reduce(
      (acc, word) =>
        acc &&
        (name.indexOf(word) !== -1 || val.startsWith(word) || word === valDec),
      true
    )
  })
}
