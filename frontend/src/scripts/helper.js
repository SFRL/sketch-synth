import annotations from "../json/annotations.json";


const eucledianDistance = (p1,p2) => Math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)


const getClosestSynthId = (noisy,thin) => {
    let minDist = 10000
    let id = undefined 
    const synthValues = annotations['annotations']

    synthValues.forEach((synth)=>{
        const dist = eucledianDistance([noisy,thin],[synth['noisy'],synth['thin']])
        if (dist<minDist) {
            minDist = dist
            id = synth['id']
        }
    })

    return id

}

export {getClosestSynthId}