// use std::fs::File;
// use std::io::prelude::*;
// use std::io;
use std::fs;
use std::io;

const VERTEX: &str = "v";
const FACE: &str = "f";

fn main() -> io::Result<()>
{   
    let mut out = Vec::new();

    for file in fs::read_dir("obj")?
    {
        out.push("[");

        let path = file?.path();
        let contents = fs::read_to_string(path)?;

        let mut vertices = vec![];

        for line in contents.lines()
        {
            let parts = line.split_whitespace()
                            .map(String::from)
                            .collect::<Vec<String>>();

            let line_type = &parts[0];

            if line_type == VERTEX
            {
                let x = parts[1].clone();
                let y = parts[2].clone();
                let z = parts[3].clone();

                vertices.push([x, y, z]);

                //println!("{}", vertices.len());
            }
            else if line_type == FACE
            {
                let _v1 = &vertices[parts[1].parse::<usize>().unwrap() - 1];
                let _v2 = &vertices[parts[2].parse::<usize>().unwrap() - 1];
                let _v3 = &vertices[parts[3].parse::<usize>().unwrap() - 1];

                println!("{}", _v1[0]);
            }

            // if line_parts.len() == 4
            // {
            //     println!("{}", line_parts[0]);
            //     for part in line_parts
            //     {
            //         println!("{}", part);
            //     }
            // }
        }

        out.push("]");
    }

    Ok(())
}
