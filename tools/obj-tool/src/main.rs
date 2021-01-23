use std::fs;
use std::io::Result;
use std::io::Write;

const VERTEX: &str = "v";
const FACE: &str = "f";

fn main() -> Result<()>
{   
    let mut out: Vec<String> = Vec::new();

    for file in fs::read_dir("obj")?
    {
        out.push(String::from("["));

        let path = file?.path();
        let contents = fs::read_to_string(path)?;

        let mut vertices = vec![];

        for line in contents.lines()
        {
            let parts: Vec<String> = line.split_whitespace()
                                         .map(String::from)
                                         .collect::<Vec<String>>();

            let line_type = &parts[0];

            if line_type == VERTEX
            {
                let x = parts[1].clone();
                let y = parts[2].clone();
                let z = parts[3].clone();

                vertices.push([x, y, z]);
            }
            else if line_type == FACE
            {
                for i in 1..4
                {
                    let v = &vertices[parts[i].parse::<usize>().unwrap() - 1];

                    for j in 0..3
                    {
                        let value = v[j].clone();

                        out.push(value);
                        out.push(String::from(", "));
                    }
                }
            }
        }

        out.push(String::from("]"));

        let mut file = fs::File::create("test.txt")?;                                                                                                          
        for s in &out
        {
            file.write(s.as_bytes())?;
        }   
    }

    Ok(())
}
