require 'strscan'
#http://weblog.jamisbuck.org/2015/7/30/writing-a-simple-recursive-descent-parser.html
# expr := term
#       | term AND expr
#       | term OR expr
# term := value
#       | atom ':' value
# atom := word+
#       | quoted_string
# value := atom
#        | '(' expr ')'


# scan(pattern) => String
# Tries to match with pattern at the current position. If there’s a match, the scanner advances the “scan pointer” and returns the matched string. Otherwise, the scanner returns nil.

# skip(pattern)
# Attempts to skip over the given pattern beginning with the scan pointer. If it matches, the scan pointer is advanced to the end of the match, and the length of the match is returned. Otherwise, nil is returned.

# It’s similar to scan, but without returning the matched string.

# pos()
# Returns the byte position of the scan pointer. In the ‘reset’ position, this value is zero. In the ‘terminated’ position (i.e. the string is exhausted), this value is the bytesize of the string.

# # simple words
# parse "compilers"
# #-> "compilers"

# # field specifications
# parse "subject:compilers"
# #-> Field.new("subject", "compilers")

# # boolean operations
# parse "subject:compilers or author:Aho"
# #-> Expression.new(:or,
# #      Field.new("subject", "compilers"),
# #      Field.new("author", "Aho"))

# # boolean operations within field specifications
# parse "subject:(compilers OR parsers)"
# #-> Field.new("subject",
# #      Expression.new(:or, "compilers", "parsers")

class Expression < Struct.new(:op, :left, :right)
end

class Field < Struct.new(:name, :value)
end

def parse_expr(scanner)
  left = parse_term(scanner)

  scanner.skip(/\s+/)
  op = scanner.scan(/AND|OR/i)

  if op
    Expression.new(op.downcase.to_sym, left, parse_expr(scanner))
  else
    left
  end
end

def parse_term(scanner)
  scanner.skip(/\s+/)

  value = parse_value(scanner)
  return value if value.is_a?(Expression)

  if scanner.skip(/:/)
    Field.new(value, parse_value(scanner))
  else
    value
  end
end

def parse_atom(scanner)
  scanner.scan(/\w+/) ||
    parse_quoted_string(scanner) ||
    raise("expected an atom at #{scanner.pos}")
end

def parse_quoted_string(scanner)
  start = scanner.pos
  delim = scanner.scan(/['"]/)
  if delim
    scanner.scan(/[^#{delim}]*/).tap do
      scanner.scan(/#{delim}/) or raise "quoted string not terminated (start at #{start})"
    end
  end
end

def parse_value(scanner)
  start = scanner.pos
  if scanner.skip(/\(/)
    parse_expr(scanner).tap do
      scanner.scan(/\)/) or raise "expression not terminated (start at #{start})"
    end
  else
    parse_atom(scanner)
  end
end

def parse(string)
  scanner = StringScanner.new(string)
  parse_expr(scanner)
end

require 'rspec'

describe "#parse" do
  it "should parse words as atoms" do
    expect(parse("hello")).to be == "hello"
  end

  it "should parse digits as atoms" do
    expect(parse("1234")).to be == "1234"
  end

  it "should parse single-quoted string as atom" do
    expect(parse("'hello world'")).to be == "hello world"
  end

  it "should parse double-quoted string as atom" do
    expect(parse('"hello world"')).to be == "hello world"
  end

  it "should parse AND expression" do
    expr = parse("hello AND world")
    expect(expr.op).to be == :and
    expect(expr.left).to be == "hello"
    expect(expr.right).to be == "world"
  end

  it "should parse OR expression" do
    expr = parse("hello OR world")
    expect(expr.op).to be == :or
    expect(expr.left).to be == "hello"
    expect(expr.right).to be == "world"
  end

  it "should chain expressions together" do
    expr = parse("hello AND world OR other")
    expect(expr.op).to be == :and
    expect(expr.left).to be == "hello"
    expect(expr.right.op).to be == :or
    expect(expr.right.left).to be == "world"
    expect(expr.right.right).to be == "other"
  end

  it "should parse field specifications" do
    field = parse("hello:world")
    expect(field.name).to be == "hello"
    expect(field.value).to be == "world"
  end

  it "should parse field specifications with quotes" do
    field = parse("hello:'cruel world'")
    expect(field.name).to be == "hello"
    expect(field.value).to be == "cruel world"
  end

  it "should parse field with expression as value" do
    field = parse("hello:(this AND that)")
    expect(field.name).to be == "hello"
    expect(field.value.op).to be == :and
    expect(field.value.left).to be == "this"
    expect(field.value.right).to be == "that"
  end
end