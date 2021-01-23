use std::fs;
use std::io::Result;
use std::io::Write;

const VERTEX: &str = "v";
const FACE: &str = "f";

fn main() -> Result<()>
{   
    for in_file in fs::read_dir("obj")?
    {
        let mut vertices = Vec::new();
        let mut out = Vec::new();
        out.push("[");

        let contents = fs::read_to_string(in_file?.path())?;
        let lines = contents.lines();

        for line in lines
        {
            let parts = line.split_whitespace().collect::<Vec<&str>>();
            let line_type = parts[0];

            if line_type == VERTEX
            {
                vertices.push([
                    parts[1], parts[2], parts[3]
                ]);
            }
            else if line_type == FACE
            {
                for i in 1..4
                {
                    let idx = parts[i].parse::<usize>().unwrap() - 1;
                    let v = vertices[idx];

                    for j in 0..3
                    {
                        out.push(v[j]);
                        out.push(", ");
                    }
                }
            }
        }

        out.push("]");

        let mut out_file = fs::File::create("test.txt")?;      
                                                                                                    
        for s in &out
        {
            out_file.write(s.as_bytes())?;
        }   
    }

    Ok(())
}
